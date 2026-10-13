import MovieGrid from "@/Components/movie-grid";
import { moviesFor } from "@/Components/movies";

const Page = () => <MovieGrid city="Bangalore" list={moviesFor("/bangalore")} />;

export default Page;
