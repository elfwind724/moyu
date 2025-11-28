import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { StoryBibleProvider } from '@/contexts/StoryBibleContext'
import { EditorProvider } from '@/contexts/EditorContext'
import { HistoryProvider } from '@/contexts/HistoryContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { StoryStateProvider } from '@/contexts/StoryStateContext'
import { StoryEngineProvider } from '@/contexts/StoryEngineContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectProvider>
      <StoryBibleProvider>
        <SettingsProvider>
          <EditorProvider>
            <HistoryProvider>
              <StoryStateProvider>
                <StoryEngineProvider>
                  <App />
                </StoryEngineProvider>
              </StoryStateProvider>
            </HistoryProvider>
          </EditorProvider>
        </SettingsProvider>
      </StoryBibleProvider>
    </ProjectProvider>
  </StrictMode>,
)
