import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCredentialsDto {
    @ApiProperty({
        description: 'The DID of the holder',
        example: 'did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK'
    })
    @IsString()
    @IsNotEmpty()
    holderDid: string;
} 