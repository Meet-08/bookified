import { cn } from "#/lib/utils";
import { SignInButton, UserButton, useAuth } from "@clerk/react";
import { Link, useLocation } from "@tanstack/react-router";

const navItems = [
	{ label: "Library", href: "/" },
	{ label: "Add New", href: "/books/new" },
	// { label: "Pricing", href: "/subscriptions" },
];

const Navbar = () => {
	const pathName = useLocation().pathname;
	const { isSignedIn, isLoaded } = useAuth();
	// const { user } = useUser();

	return (
		<header className="w-full fixed z-50 bg-(--bg-primary)">
			<div className="wrapper navbar-height py-4 flex justify-between items-center">
				<Link to="/" className="flex gap-0.5 items-center">
					<img src="/assets/logo.png" alt="Bookified" width={42} height={26} />
					<span className="logo-text">Bookified</span>
				</Link>

				<nav className="w-fit flex gap-7.5 items-center">
					{navItems.map(({ label, href }) => {
						const isActive =
							pathName === href || (href !== "/" && pathName.startsWith(href));
						return (
							<Link
								to={href}
								key={label}
								className={cn(
									"nav-link-base",
									isActive ? "nav-link-active" : "text-black hover:opacity-70",
								)}
							>
								{label}
							</Link>
						);
					})}

					{isLoaded && (
						<div className="flex gap-7.5 items-center">
							{!isSignedIn && <SignInButton mode="modal" />}
							{isSignedIn && (
								<div className="nav-user-link">
									<UserButton />
									{/* {user?.firstName && (
										<Link to="/subscriptions" className="nav-user-name">
											{user.firstName}
										</Link>
									)} */}
								</div>
							)}
						</div>
					)}
				</nav>
			</div>
		</header>
	);
};

export default Navbar;
