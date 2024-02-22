import { Test, TestingModule } from '@nestjs/testing';
import { DiplomaController } from './diploma.controller';

describe('DiplomaController', () => {
  let controller: DiplomaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiplomaController],
    }).compile();

    controller = module.get<DiplomaController>(DiplomaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
