import Charts
import ClerkKit
import ClerkKitUI
import SwiftUI

@main
struct BaerVaultApp: App {
    private let server: URL?

    init() {
        let bundle = Bundle.main
        let url = (bundle.object(forInfoDictionaryKey: "BaerVaultAPI") as? String).flatMap { URL(string: $0) }
        let key = bundle.object(forInfoDictionaryKey: "ClerkPublishableKey") as? String ?? ""
        if let url, url.scheme == "https", url.host != nil, url.user == nil, url.password == nil,
           key.hasPrefix("pk_live_") || key.hasPrefix("pk_test_") {
            Clerk.configure(publishableKey: key)
            server = url
        } else {
            server = nil
        }
    }

    var body: some Scene {
        WindowGroup {
            if let server {
                HouseholdView(server: server).environment(Clerk.shared)
            } else {
                ContentUnavailableView(
                    "BaerVault setup needed",
                    systemImage: "gear",
                    description: Text("Configure the BaerVault server and Clerk publishable key before building.")
                )
            }
        }
    }
}

private struct HouseholdView: View {
    @Environment(Clerk.self) private var clerk
    @State private var showSignIn = false
    @State private var failedCallback = false
    let server: URL

    var body: some View {
        NavigationStack {
            Group {
                if let session = clerk.session, let household = session.lastActiveOrganizationId {
                    FinanceView(server: server)
                        .id([session.id, household])
                } else if clerk.session != nil {
                    ContentUnavailableView("Select a household", systemImage: "person.2")
                } else {
                    Button("Sign in to BaerVault") { showSignIn = true }
                        .buttonStyle(.borderedProminent)
                }
            }
            .navigationTitle("BaerVault")
            .toolbar {
                if clerk.session != nil {
                    ToolbarItem(placement: .topBarLeading) { OrganizationSwitcher() }
                    ToolbarItem(placement: .topBarTrailing) { UserButton() }
                }
            }
        }
        .sheet(isPresented: $showSignIn) { AuthView().environment(clerk) }
        .onChange(of: clerk.session?.id) { _, session in
            if session != nil { showSignIn = false }
        }
        .onOpenURL { url in
            Task {
                do { try await clerk.handle(url) }
                catch { failedCallback = true }
            }
        }
        .alert("Could not finish sign-in", isPresented: $failedCallback) {
            Button("OK", role: .cancel) {}
        }
    }
}

private struct FinanceView: View {
    @Environment(Clerk.self) private var clerk
    @State private var month = Date()
    @State private var reload = 0
    @State private var budget: Budget?
    @State private var error: String?
    let server: URL

    var body: some View {
        VStack {
            HStack {
                Button { moveMonth(-1) } label: { Image(systemName: "chevron.left") }
                    .accessibilityLabel("Previous month")
                Spacer()
                Text(month.formatted(.dateTime.month(.wide).year())).font(.headline)
                Spacer()
                Button { moveMonth(1) } label: { Image(systemName: "chevron.right") }
                    .accessibilityLabel("Next month")
            }
            .padding()
            if let error {
                ContentUnavailableView {
                    Label("Could not load budget", systemImage: "wifi.exclamationmark")
                } description: {
                    Text(error)
                } actions: {
                    Button("Retry") { reload += 1 }
                }
            } else if let budget {
                TabView {
                    List {
                        Section("This month") {
                            LabeledContent("Income", value: money(budget.incomeEntries.reduce(0) { $0 + $1.amount }))
                            LabeledContent("Planned", value: money(budget.categories.reduce(0) { $0 + $1.plannedAmount }))
                            LabeledContent("Spent", value: money(budget.categories.reduce(0) { $0 + $1.spent }))
                        }
                        if !budget.categories.isEmpty {
                            Section("Spending by category") {
                                Chart(budget.categories) { category in
                                    BarMark(x: .value("Spent", NSDecimalNumber(decimal: category.spent).doubleValue),
                                            y: .value("Category", category.name))
                                        .accessibilityLabel(category.name)
                                        .accessibilityValue(money(category.spent))
                                }
                                .frame(minHeight: CGFloat(budget.categories.count) * 24)
                            }
                        }
                    }
                    .tabItem { Label("Home", systemImage: "house") }

                    List(budget.categories) { category in
                        VStack(alignment: .leading) {
                            Text(category.name).font(.headline)
                            LabeledContent("Planned", value: money(category.plannedAmount))
                            LabeledContent("Spent", value: money(category.spent))
                            LabeledContent("Remaining", value: money(category.plannedAmount - category.spent))
                        }
                    }
                    .overlay {
                        if budget.categories.isEmpty {
                            ContentUnavailableView("No budget categories", systemImage: "list.bullet")
                        }
                    }
                    .tabItem { Label("Budget", systemImage: "chart.pie") }

                    let purchases = budget.categories.flatMap(\.purchases).sorted { $0.date > $1.date }
                    List(purchases) { purchase in
                        VStack(alignment: .leading) {
                            LabeledContent(purchase.description, value: money(purchase.amount))
                            Text(purchase.date).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                    .overlay {
                        if purchases.isEmpty {
                            ContentUnavailableView("No budget purchases", systemImage: "cart")
                        }
                    }
                    .tabItem { Label("Purchases", systemImage: "cart") }
                }
            } else {
                Spacer()
                ProgressView("Loading budget")
                Spacer()
            }
        }
        .task(id: LoadKey(month: month, reload: reload)) { await load() }
    }

    private func moveMonth(_ offset: Int) {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .current
        if let next = calendar.date(byAdding: .month, value: offset, to: month) {
            budget = nil
            error = nil
            month = next
        }
    }

    private func load() async {
        error = nil
        let calendar = Calendar(identifier: .gregorian)
        let parts = calendar.dateComponents([.year, .month], from: month)
        guard let year = parts.year, let number = parts.month else { return }
        do {
            guard let token = try await clerk.auth.getToken() else {
                error = "Sign in again to load your household budget."
                return
            }
            try Task.checkCancellation()
            let endpoint = server.appendingPathComponent("api").appendingPathComponent("mobile-shell")
            var components = URLComponents(url: endpoint, resolvingAgainstBaseURL: false)
            components?.queryItems = [
                URLQueryItem(name: "year", value: String(year)),
                URLQueryItem(name: "month", value: String(number))
            ]
            guard let url = components?.url else { throw URLError(.badURL) }
            let response = try await MobileAPI.budget(url: url, token: token)
            try Task.checkCancellation()
            budget = response
        } catch {
            guard !Task.isCancelled else { return }
            self.error = "Check your connection and confirm you selected an active household."
        }
    }

    private func money(_ amount: Decimal) -> String {
        amount.formatted(.currency(code: "USD"))
    }
}

private enum MobileAPI {
    static func budget(url: URL, token: String) async throws -> Budget {
        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData)
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let (data, response) = try await URLSession.shared.data(for: request)
        guard let response = response as? HTTPURLResponse, response.statusCode == 200 else {
            throw URLError(.badServerResponse)
        }
        return try JSONDecoder().decode(MobileShell.self, from: data).selectedMonth
    }
}

private struct LoadKey: Equatable {
    let month: Date
    let reload: Int
}

private struct MobileShell: Decodable {
    let selectedMonth: Budget
}

private struct Budget: Decodable {
    let incomeEntries: [Income]
    let categories: [Category]
}

private struct Income: Decodable {
    let amount: Decimal
}

private struct Category: Decodable, Identifiable {
    let id: String
    let name: String
    let plannedAmount: Decimal
    let purchases: [Purchase]
    var spent: Decimal { purchases.reduce(0) { $0 + $1.amount } }
}

private struct Purchase: Decodable, Identifiable {
    let id: String
    let amount: Decimal
    let description: String
    let date: String
}
