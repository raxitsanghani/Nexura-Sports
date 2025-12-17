import { useMemo } from "react";

interface RatingDistribution {
  [star: number]: number; // e.g., { 5: 20, 4: 10, 3: 4, 2: 2, 1: 1 }
}

interface AverageRatingResult {
  averageRating: number;
  totalPeople: number;
}

const useAverageRating = (
  ratingDistribution: RatingDistribution
): AverageRatingResult => {
  return useMemo(() => {
    if (!ratingDistribution || typeof ratingDistribution !== "object") {
      // Handle invalid input
      return {
        averageRating: 0,
        totalPeople: 0,
      };
    }

    let totalRatings = 0;
    let weightedSum = 0;

    // Iterate over ratingDistribution
    for (const [star, count] of Object.entries(ratingDistribution)) {
      const starRating = parseInt(star, 10);
      const numPeople = parseInt(count, 10);

      if (isNaN(starRating) || isNaN(numPeople)) {
        // Handle invalid star or count values
        continue;
      }

      totalRatings += numPeople;
      weightedSum += starRating * numPeople;
    }

    const averageRating = totalRatings === 0 ? 0 : weightedSum / totalRatings;

    return {
      averageRating,
      totalPeople: totalRatings,
    };
  }, [ratingDistribution]);
};

export default useAverageRating;
