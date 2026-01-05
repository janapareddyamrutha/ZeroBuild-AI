
import { Project, UserAccount } from '../types';

const PROJECTS_KEY = 'zerobuild_projects';
const ACCOUNTS_KEY = 'zerobuild_accounts';

export const storageService = {
  // Accounts
  getAccounts: (): UserAccount[] => {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveAccount: (account: UserAccount): void => {
    const accounts = storageService.getAccounts();
    if (!accounts.find(a => a.email === account.email)) {
      accounts.push(account);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
  },

  // Projects
  getProjects: (): Project[] => {
    const data = localStorage.getItem(PROJECTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveProject: (project: Project): void => {
    const projects = storageService.getProjects();
    const index = projects.findIndex(p => p.id === project.id);
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  deleteProject: (id: string): void => {
    const projects = storageService.getProjects();
    const filtered = projects.filter(p => p.id !== id);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  },

  deleteAllProjects: (): void => {
    localStorage.removeItem(PROJECTS_KEY);
  }
};
