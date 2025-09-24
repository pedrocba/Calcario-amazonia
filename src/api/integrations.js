// Temporariamente desabilitado - usando apenas Supabase
// import { base44 } from './base44Client';

// Mock integrations para evitar erros durante a transição
const createMockIntegration = (name) => ({
  invoke: () => Promise.resolve({ data: null, error: null })
});

// Export mock integrations
export const Core = {
  InvokeLLM: createMockIntegration('InvokeLLM'),
  SendEmail: createMockIntegration('SendEmail'),
  UploadFile: createMockIntegration('UploadFile'),
  GenerateImage: createMockIntegration('GenerateImage'),
  ExtractDataFromUploadedFile: createMockIntegration('ExtractDataFromUploadedFile'),
  CreateFileSignedUrl: createMockIntegration('CreateFileSignedUrl'),
  UploadPrivateFile: createMockIntegration('UploadPrivateFile')
};

export const InvokeLLM = Core.InvokeLLM;
export const SendEmail = Core.SendEmail;
export const UploadFile = Core.UploadFile;
export const GenerateImage = Core.GenerateImage;
export const ExtractDataFromUploadedFile = Core.ExtractDataFromUploadedFile;
export const CreateFileSignedUrl = Core.CreateFileSignedUrl;
export const UploadPrivateFile = Core.UploadPrivateFile;