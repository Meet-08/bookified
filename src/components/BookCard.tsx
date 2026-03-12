import { useAuth } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import type { BookCardProps } from "types";

const BookCard = ({ title, author, coverURL, slug }: BookCardProps) => {
	const { userId } = useAuth();

	return (
		<Link
			to={`/books/$slug`}
			params={{ slug }}
			onClick={(event) => {
				if (userId) {
					return;
				}

				event.preventDefault();
				toast.error("You must be logged in to view this book.");
			}}
		>
			<article className="book-card">
				<figure className="book-card-figure">
					<div className="book-card-cover-wrapper">
						<img
							src={coverURL}
							alt={title}
							width={133}
							height={200}
							className="book-card-cover"
						/>
					</div>
					<figcaption className="book-card-meta">
						<h3 className="book-card-title">{title}</h3>
						<p className="book-card-author">{author}</p>
					</figcaption>
				</figure>
			</article>
		</Link>
	);
};

export default BookCard;
