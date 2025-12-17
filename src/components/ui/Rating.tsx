import Rating from "@mui/material/Rating";
import Stack from "@mui/material/Stack";
// Define props for the RatingProvider component
interface RatingProviderProps {
  size: number | string; // size of the Rating component
  rating: number; // current rating value
}

export default function RatingProvider({ size, rating }: RatingProviderProps) {
  return (
    <Stack spacing={1}>
      {/* <Rating name="half-rating" defaultValue={2.5} precision={0.5} /> */}
      <Rating
        className="z-0"
        name="half-rating-read"
        value={rating}
        precision={0.5}
        readOnly
        sx={{ fontSize: size }}
      />
    </Stack>
  );
}
