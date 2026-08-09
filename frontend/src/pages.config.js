import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Collection from './pages/Collection';
import CollectorSearch from './pages/CollectorSearch';
import PublicVault from './pages/PublicVault';
import TradeManager from './pages/TradeManager';
import PopExplorer from './pages/PopExplorer';
import PopMessenger from './pages/PopMessenger';
import CommunityChat from './pages/CommunityChat';
import Layout from './Layout';

export const PAGES = {
    "Landing": Landing,
    "Dashboard": Dashboard,
    "Collection": Collection,
    "CollectorSearch": CollectorSearch,
    "PublicVault": PublicVault,
    "TradeManager": TradeManager,
    "PopExplorer": PopExplorer,
    "PopMessenger": PopMessenger,
    "CommunityChat": CommunityChat,
}

export const pagesConfig = {
    mainPage: "Landing",
    Pages: PAGES,
    Layout: Layout,
};