interface OsIconProps {
  size?: number;
  color?: string;
}

export function WindowsIcon({ size = 24, color = "#0078D4" }: OsIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0h11.377v11.372H0zm12.623 0H24v11.372H12.623zM0 12.628h11.377V24H0zm12.623 0H24V24H12.623z" />
    </svg>
  );
}

export function MacIcon({ size = 24, color = "#737373" }: OsIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

export function IOSIcon({ size = 24, color = "currentColor" }: OsIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="9"
        fontWeight="600"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
        fill={color}
      >
        iOS
      </text>
    </svg>
  );
}

export function AndroidIcon({ size = 24, color = "#97C03D" }: OsIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      {/* Antennae */}
      <line x1="8.5" y1="1" x2="6.5" y2="3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="15.5" y1="1" x2="17.5" y2="3.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      {/* Head */}
      <path d="M6.5 7.5C6.5 5.015 9.01 3 12 3s5.5 2.015 5.5 4.5V9H6.5V7.5Z" />
      {/* Eyes */}
      <circle cx="9.5" cy="6.2" r="0.75" fill="white" />
      <circle cx="14.5" cy="6.2" r="0.75" fill="white" />
      {/* Body */}
      <rect x="5.5" y="9.5" width="13" height="8.5" rx="1" />
      {/* Left arm */}
      <rect x="2.5" y="9.5" width="2.5" height="6.5" rx="1.25" />
      {/* Right arm */}
      <rect x="19" y="9.5" width="2.5" height="6.5" rx="1.25" />
      {/* Left leg */}
      <rect x="7" y="18.5" width="3" height="4.5" rx="1.25" />
      {/* Right leg */}
      <rect x="14" y="18.5" width="3" height="4.5" rx="1.25" />
    </svg>
  );
}

export function LinuxIcon({ size = 24, color = "currentColor" }: OsIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a3.2 3.2 0 0 0 1.182 1.988c.609.414 1.399.64 2.216.74.817.1 1.666.074 2.44-.077 1.566-.303 2.823-1.099 3.406-2.394.175-.39.268-.809.254-1.232a2.7 2.7 0 0 0-.338-1.226 3.26 3.26 0 0 0-.796-.954 4.313 4.313 0 0 0-1.093-.633 5.73 5.73 0 0 0-1.252-.317 6.268 6.268 0 0 0-1.274-.049 5.982 5.982 0 0 0-1.23.218 4.893 4.893 0 0 0-1.085.505 3.82 3.82 0 0 0-.829.768 2.884 2.884 0 0 0-.479.983 2.41 2.41 0 0 0-.032 1.05c.084.349.252.674.487.945.236.27.537.484.876.624.34.14.714.205 1.089.19a2.88 2.88 0 0 0 1.046-.247c.32-.14.605-.347.83-.604.224-.257.385-.563.465-.891a2.04 2.04 0 0 0-.028-.952 1.97 1.97 0 0 0-.456-.813 2.29 2.29 0 0 0-.773-.522 2.777 2.777 0 0 0-.966-.194 2.95 2.95 0 0 0-.98.147 2.564 2.564 0 0 0-.835.467 2.19 2.19 0 0 0-.557.726 1.92 1.92 0 0 0-.165.878c.014.3.093.594.23.862.138.267.332.507.567.7.235.193.51.336.801.42.291.084.597.108.899.07a2.23 2.23 0 0 0 .837-.287c.248-.152.46-.358.616-.602.155-.243.251-.52.277-.808a1.77 1.77 0 0 0-.112-.784 1.963 1.963 0 0 0-.436-.649 2.254 2.254 0 0 0-.665-.44 2.572 2.572 0 0 0-.816-.185" />
    </svg>
  );
}
