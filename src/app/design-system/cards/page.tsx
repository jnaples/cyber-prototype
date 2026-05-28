import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Collapse,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

// Material Symbol icon component
function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: size }}>
      {name}
    </span>
  );
}

export default function CardsDocs() {
  const [expanded, setExpanded] = useState(false);

  return (
    <Container maxWidth="lg">
      <Stack spacing={4}>
        <Typography variant="cardTitle">Card Components</Typography>

        {/* Basic Card */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Basic Card
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card sx={{ maxWidth: 345, "& .MuiCardContent-root": { pb: 2 } }}>
              <CardContent>
                <Typography gutterBottom variant="cardTitle" component="div">
                  Basic Card
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This is a basic card with just content. Cards contain content
                  and actions about a single subject.
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Card with Actions */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Card with Actions
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card sx={{ maxWidth: 345, "& .MuiCardContent-root": { pb: 2 } }}>
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Card with Actions
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cards can include action buttons at the bottom for user
                  interactions.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Share</Button>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Card with Media */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Card with Media
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card sx={{ maxWidth: 345, "& .MuiCardContent-root": { pb: 2 } }}>
              <CardMedia
                component="img"
                height="140"
                image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                alt="green iguana"
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Lizard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Lizards are a widespread group of squamate reptiles, with over
                  6,000 species, ranging across all continents except
                  Antarctica.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Share</Button>
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Card with Header */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Card with Header
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card sx={{ maxWidth: 345, "& .MuiCardContent-root": { pb: 2 } }}>
              <CardHeader
                title="Card Header"
                subheader="September 14, 2024"
                action={
                  <IconButton aria-label="settings">
                    <Icon name="more_vert" />
                  </IconButton>
                }
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  This card has a header component that can include a title,
                  subheader, avatar, and action items.
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <Icon name="favorite" />
                </IconButton>
                <IconButton aria-label="share">
                  <Icon name="share" />
                </IconButton>
              </CardActions>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Card with Action Area */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Card with Action Area
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card sx={{ maxWidth: 345 }}>
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image="https://mui.com/static/images/cards/contemplative-reptile.jpg"
                  alt="green iguana"
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Clickable Card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    The entire card is clickable when wrapped in CardActionArea.
                    This provides a ripple effect on click.
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Outlined Card */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Outlined Card
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card
              variant="outlined"
              sx={{ maxWidth: 345, "& .MuiCardContent-root": { pb: 2 } }}
            >
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  Outlined Card
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Cards can have an outlined variant instead of the default
                  elevated style.
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small">Action</Button>
              </CardActions>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Expandable Card */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Expandable Card
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{ flexWrap: "wrap" }}
          >
            <Card sx={{ maxWidth: 345, "& .MuiCardContent-root": { pb: 2 } }}>
              <CardHeader title="Expandable Card" subheader="Click to expand" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  This card can expand to reveal more content.
                </Typography>
              </CardContent>
              <CardActions disableSpacing>
                <IconButton aria-label="add to favorites">
                  <Icon name="favorite" />
                </IconButton>
                <IconButton aria-label="share">
                  <Icon name="share" />
                </IconButton>
                <IconButton
                  onClick={() => setExpanded(!expanded)}
                  aria-expanded={expanded}
                  aria-label="show more"
                  sx={{
                    marginLeft: "auto",
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.3s",
                  }}
                >
                  <Icon name="expand_more" />
                </IconButton>
              </CardActions>
              <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography sx={{ mb: 2 }}>Additional Content:</Typography>
                  <Typography sx={{ mb: 2 }}>
                    This content is hidden by default and can be expanded by
                    clicking the expand icon. This is useful for showing
                    detailed information without cluttering the initial view.
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    You can include any content here such as text, images, or
                    other components.
                  </Typography>
                </CardContent>
              </Collapse>
            </Card>
          </Stack>
        </Box>

        <Divider />

        {/* Card Grid */}
        <Box>
          <Typography variant="h5" gutterBottom>
            Card Grid Example
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            useFlexGap
            sx={{
              flexWrap: "wrap",
              "& > *": { flex: "1 1 300px", maxWidth: 345 },
            }}
          >
            {[1, 2, 3].map((item) => (
              <Card key={item} sx={{ "& .MuiCardContent-root": { pb: 2 } }}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    Card {item}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is card number {item} in a responsive grid layout.
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small">Action</Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  );
}
