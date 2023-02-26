import AuthLogo from './extensions/config.auth.logo.png';
import Logo from './extensions/logo.png';

const config = {
  auth: {
    logo: AuthLogo,
  },
  head: {
    favicon: Logo,
  },
  locales: [
    'en'
  ],
  main: {
    logo: AuthLogo,
  },
  menu: {
    logo: Logo,
  },
  theme: {
    borderRadius: '0px'
  },
  translations: {
    en: {
      "HomePage.helmet.title": "Admin Gorilla Pack",
      "app.components.LeftMenu.navbrand.title": "Gorilla Pack",
      "app.components.LeftMenu.navbrand.workplace": "Administração da Loja",
      "app.components.HomePage.welcome.": "Gorilla Pack | Content Management System",
      "app.components.HomePage.welcomeBlock.content": "Bem-vindo ao Sistema de Gerenciamento de Conteúdo do e-commerce do Gorilla Pack, o admin da loja. Utilize a sidebar à esquerda para navegar nas opções disponíveis. Os conteúdos em inglês nesta página são links para tutoriais do Strapi, a plataforma que gerencia o backend desta loja.",
      "app.components.HomePage.button.blog": "Blog do Strapi."
    },
  },
  tutorials: false,
  notifications: { release: false },
};

const bootstrap = (app) => {
  console.log(app);
};

export default {
  config,
  bootstrap,
};
