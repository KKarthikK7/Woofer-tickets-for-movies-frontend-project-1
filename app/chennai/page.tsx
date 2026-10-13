import MovieGrid from "@/Components/movie-grid";
import { moviesFor } from "@/Components/movies";

const Page = () => <MovieGrid city="Chennai" list={moviesFor("/chennai")} />;

export default Page;
