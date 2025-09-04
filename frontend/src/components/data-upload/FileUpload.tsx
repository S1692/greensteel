import React, { useRef } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/atomic/atoms';

interface FileUploadProps {
  inputFile: File | null;
  isInputUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onFileChange: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({
  inputFile,
  isInputUploading,
  onFileSelect,
  onUpload,
  onFileChange,
  onDrop,
  onDragOver
}) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className='stitch-card p-6'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
          <Upload className='w-5 h-5 text-green-600' />
        </div>
        <div>
          <h2 className='text-lg font-semibold text-white'>Excel 업로드</h2>
          <p className='text-sm text-white/60'>템플릿 형식에 맞는 Excel 파일을 업로드하면 AI가 자동으로 투입물명을 표준화합니다</p>
        </div>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
          inputFile
            ? 'border-green-400 bg-green-50'
            : 'border-white/20 hover:border-primary hover:bg-white/5'
        }`}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <input
          ref={inputFileRef}
          type='file'
          accept='.xlsx,.xls'
          onChange={onFileSelect}
          className='hidden'
        />
        
        {!inputFile ? (
          <div className='space-y-4'>
            <div className='w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center'>
              <Upload className='w-8 h-8 text-white/60' />
            </div>
            <div>
              <p className='text-lg font-medium text-white mb-2'>
                파일을 드래그하여 업로드하거나 클릭하여 선택하세요
              </p>
              <p className='text-sm text-white/60 mb-4'>
                지원 형식: .xlsx, .xls
              </p>
              <Button
                onClick={() => inputFileRef.current?.click()}
                className='bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg transition-colors'
              >
                파일 선택
              </Button>
            </div>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
              <FileSpreadsheet className='w-8 h-8 text-green-600' />
            </div>
            <div>
              <p className='text-lg font-medium text-white mb-2'>
                선택된 파일: {inputFile.name}
              </p>
              <p className='text-sm text-white/60 mb-4'>
                파일 크기: {(inputFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <div className='flex gap-3 justify-center'>
                <Button
                  onClick={onUpload}
                  disabled={isInputUploading}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50'
                >
                  {isInputUploading ? '업로드 중...' : '업로드 시작'}
                </Button>
                <Button
                  onClick={onFileChange}
                  className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors'
                >
                  파일 변경
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
