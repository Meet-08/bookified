import { cn } from "#/lib/utils";
import { SignInButton, UserButton, useAuth, useUser } from "@clerk/react";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
	{ label: "Library", href: "/" },
	{ label: "Add New", href: "/books/new" },
	{ label: "Pricing", href: "/subscriptions" },
];

const Navbar = () => {
	const pathName = useLocation().pathname;
	const { isSignedIn, isLoaded } = useAuth();
	const { user } = useUser();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<header className="w-full fixed z-50 bg-(--bg-primary)">
			<div className="wrapper navbar-height py-4 flex justify-between items-center">
				<Link to="/" className="flex gap-0.5 items-center">
					<img src="/assets/logo.png" alt="Bookified" width={42} height={26} />
					<span className="logo-text">Bookified</span>
				</Link>

				<button
					type="button"
					className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
					onClick={() => setIsMobileMenuOpen((prev) => !prev)}
					aria-label={
						isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
					}
					aria-expanded={isMobileMenuOpen}
				>
					{isMobileMenuOpen ? (
						<X className="size-5" />
					) : (
						<Menu className="size-5" />
					)}
				</button>

				<nav className="hidden md:flex w-fit gap-7.5 items-center">
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
									{user?.firstName && (
										<Link to="/subscriptions" className="nav-user-name">
											{user.firstName}
										</Link>
									)}
								</div>
							)}
						</div>
					)}
				</nav>
			</div>

			{isMobileMenuOpen && (
				<nav className="md:hidden border-t border-(--border-subtle) bg-(--bg-primary)">
					<div className="wrapper py-4 flex flex-col gap-4">
						{navItems.map(({ label, href }) => {
							const isActive =
								pathName === href ||
								(href !== "/" && pathName.startsWith(href));
							return (
								<Link
									to={href}
									key={label}
									onClick={() => setIsMobileMenuOpen(false)}
									className={cn(
										"nav-link-base w-fit",
										isActive
											? "nav-link-active"
											: "text-black hover:opacity-70",
									)}
								>
									{label}
								</Link>
							);
						})}

						{isLoaded && (
							<div className="flex flex-col gap-3 pt-1">
								{!isSignedIn && <SignInButton mode="modal" />}
								{isSignedIn && (
									<div className="flex items-center gap-3">
										<UserButton />
										{user?.firstName && (
											<Link
												to="/subscriptions"
												onClick={() => setIsMobileMenuOpen(false)}
												className="text-base font-medium text-black"
											>
												{user.firstName}
											</Link>
										)}
									</div>
								)}
							</div>
						)}
					</div>
				</nav>
			)}
		</header>
	);
};

export default Navbar;
