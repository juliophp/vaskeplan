import { createFileRoute } from '@tanstack/react-router';
import Home from '../views/Home.jsx';
export const Route = createFileRoute('/_app/')({ component: Home });
