// utils/calculateAverageRating.ts
interface RatingDistribution {
  [star: number]: number; // e.g., { 5: 20, 4: 10, 3: 4, 2: 2, 1: 1 }
}

const calculateAverageRating = (ratingDistribution: RatingDistribution) => {
  let totalRatings = 0;
  let weightedSum = 0;

  if (!ratingDistribution) {
    return { averageRating: 0, totalPeople: 0 };
  }

  for (const [star, count] of Object.entries(ratingDistribution)) {
    const starRating = parseInt(star, 10);
    const numPeople = parseInt(count, 10);

    if (isNaN(starRating) || isNaN(numPeople)) {
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
};

export default calculateAverageRating;
