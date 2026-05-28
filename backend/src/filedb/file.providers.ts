
import { DataSource } from 'typeorm';
import { FileUpload } from './file.entity';

export const fileProviders = [
  {
    provide: 'FILE_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(FileUpload),
    inject: ['DATA_SOURCE'],
  },
];
