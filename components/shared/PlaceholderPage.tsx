import { Container, Paper, Stack, Text, Title } from "@mantine/core";

type PlaceholderPageProps = { title: string };

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Container component="main" size="md" py={{ base: "xl", sm: 64 }} px="md">
      <Paper withBorder radius="md" p={{ base: "lg", sm: "xl" }}>
        <Stack gap="xs">
          <Text c="dimmed" fw={600} size="sm">BearVault</Text>
          <Title order={1}>{title}</Title>
          <Text c="dimmed">This area is ready for future household finance tools.</Text>
        </Stack>
      </Paper>
    </Container>
  );
}
