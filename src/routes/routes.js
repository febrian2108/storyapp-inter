import { HomePage } from '../views/pages/home-pages.js';
import { AddStoryPage } from '../views/pages/add-story-pages.js';
import { MapPage } from '../views/pages/map-pages.js';
import { DetailPage } from '../views/pages/detail-pages.js';
import { LoginPage } from '../views/pages/login-pages.js';
import { RegisterPage } from '../views/pages/register-pages.js';
import { FavoritesPage } from '../views/pages/save-pages.js';

const routes = {
  '/': {
    view: HomePage,
  },
  '/add': {
    view: AddStoryPage,
  },
  '/map': {
    view: MapPage,
  },
  '/detail': {
    view: DetailPage,
  },
  '/login': {
    view: LoginPage,
  },
  '/register': {
    view: RegisterPage,
  },
  '/favorites': {
    view: FavoritesPage,
  }
};

export { routes };