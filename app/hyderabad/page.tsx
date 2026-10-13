import MovieGrid from "@/Components/movie-grid";
import { moviesFor } from "@/Components/movies";

const Page = () => <MovieGrid city="Hyderabad" list={moviesFor("/hyderabad")} />;

export default Page;
