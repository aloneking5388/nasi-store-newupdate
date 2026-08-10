interface Review {
    id: string;
    name: string;
    rating: number;
    review: string;
    date: string;
    productId: string;
    createdAt: string;
}

interface ReviewData {
    reviews: Review[];
    totalReview: number;
    rating_review: any[]; // Replace 'any' with the correct type if known
    totalPages: number;
    currentPage: number;
}

interface GetReviewParams {
    productId: string;
    pageNumber: number;
}

interface ReviewState {
    loader: boolean;
    successMessage: string;
    errorMessage: string;
    reviews: Review[];
    totalReview: number;
    rating_review: any[]; // Replace 'any' with the correct type if known
    totalPages: number;
    currentPage: number;
}