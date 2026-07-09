import { Injectable } from '@nestjs/common';

@Injectable()
export class BranchesService {
  getAll() {
    return ['Branches endpoint'];
  }
}