import Fab from "@mui/material/Fab";
import { useColorScheme, useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";

function Icon({
  name,
  size = 24,
  color,
}: {
  name: string;
  size?: number;
  color?: string;
}) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: size,
        color: color,
      }}
    >
      {name}
    </span>
  );
}

export const ThemeModeToggle = ({ inline }: { inline?: boolean }) => {
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();

  const toggleMode = () => {
    setMode(mode === "dark" ? "light" : "dark");
  };

  const isDark = mode === "dark";

  if (inline) {
    // Render a compact inline button suitable for side nav placement
    return (
      <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <button
          onClick={toggleMode}
          aria-label="Toggle dark mode"
          style={{
            padding: "5px",
            paddingBottom: "7.5px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: theme.palette.primary.contrastText,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isDark ? (
            <Icon name="light_mode" color={theme.palette.primary.contrastText} />
          ) : (
            <Icon name="dark_mode" color={theme.palette.primary.contrastText} />
          )}
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <Fab
        size="medium"
        onClick={toggleMode}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1100,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          "&:hover": {
            bgcolor: theme.palette.primary.dark,
          },
        }}
        aria-label="Toggle dark mode"
      >
        {isDark ? <Icon name="light_mode" /> : <Icon name="dark_mode" />}
      </Fab>
    </Tooltip>
  );
};
