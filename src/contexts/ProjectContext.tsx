import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project } from '@/types/project';
import { sampleProject } from '@/data/sampleData';

interface ProjectContextType {
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project>(() => {
    try {
      const saved = localStorage.getItem('ai-pcc-project');
      return saved ? JSON.parse(saved) : sampleProject;
    } catch {
      return sampleProject;
    }
  });

  useEffect(() => {
    localStorage.setItem('ai-pcc-project', JSON.stringify(project));
  }, [project]);

  return (
    <ProjectContext.Provider value={{ project, setProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject must be used within ProjectProvider');
  return ctx;
}
