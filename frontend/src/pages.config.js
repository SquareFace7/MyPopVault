import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import Layout from './Layout';


export const PAGES = {
    "Landing": Landing,
    "Dashboard": Dashboard,
    "Collection": Collection,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: Layout,
};