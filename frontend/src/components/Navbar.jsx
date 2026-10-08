import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { Menu, Moon, ShieldCheck, Sun, Vote, X } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useTheme } from "../context/ThemeContext";
import WalletConnect from "./WalletConnect";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/election", label: "Election" },
  { to: "/candidates", label: "Candidates" },
  { to: "/results", label: "Results" },
  { to: "/about", label: "About" },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="btn-secondary !p-2.5" aria-label="Toggle colour theme" title="Toggle theme">
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export default function Navbar() {
  const { isOwner } = useWeb3();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileOpen(false), [location.pathname]);

  const links = [...LINKS, { to: "/admin", label: "Admin", icon: ShieldCheck }];

  const linkClass = ({ isActive }) =>
    `relative rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? "text-indigo-600 dark:text-white bg-indigo-500/10" : "text-muted hover:text-[color:var(--text)] hover:bg-indigo-500/5"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--glass-border)] bg-[color:var(--glass)] backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 p-2 text-white shadow-glow">
            <Vote className="h-5 w-5" />
          </div>
          <span className="text-lg font-extrabold tracking-tight">
            Block<span className="text-gradient">Vote</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
              <span className="inline-flex items-center gap-1.5">
                {link.icon && <link.icon className={`h-4 w-4 ${isOwner ? "text-amber-500" : ""}`} />}
                {link.label}
              </span>
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggle />
          <WalletConnect />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button onClick={() => setMobileOpen((o) => !o)} className="btn-secondary !p-2.5" aria-label="Open menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="animate-fade-up border-t border-[color:var(--glass-border)] px-4 pb-5 pt-3 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-4">
            <WalletConnect fullWidth />
          </div>
        </div>
      )}
    </header>
  );
}
