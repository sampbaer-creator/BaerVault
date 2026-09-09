type BaerVaultLogoProps = {
  compact?: boolean;
};

export function BaerVaultLogo({ compact = false }: BaerVaultLogoProps) {
  if (compact) {
    return <strong>BV</strong>;
  }

  return <strong>BearVault</strong>;
}