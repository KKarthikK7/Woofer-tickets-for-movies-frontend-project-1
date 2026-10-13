import MovieGrid from "@/Components/movie-grid";
import { moviesFor } from "@/Components/movies";

const Page = () => <MovieGrid city="Mumbai" list={moviesFor("/mumbai")} />;

export default Page;
