import { randomUUID } from 'crypto';
import { ICryptoService } from '../shared/system/crypto';

class CryptoService implements ICryptoService {
  public generateUUID = (): string => randomUUID();
}

export default CryptoService;
