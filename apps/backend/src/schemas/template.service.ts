// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { CredentialTemplate } from '../entities/credential-template.entity';
// import { SchemaService } from '../schema/schema.service';

// @Injectable()
// export class TemplateService {
//     constructor(
//         @InjectRepository(CredentialTemplate)
//         private templateRepository: Repository<CredentialTemplate>,
//         private schemaService: SchemaService
//     ) { }

//     async create(createTemplateDto: CreateTemplateDto): Promise<CredentialTemplate> {
//         // Validate schema exists
//         await this.schemaService.findOne(createTemplateDto.schemaId);

//         // Validate template variables match schema properties
//         await this.validateTemplateAgainstSchema(
//             createTemplateDto.template,
//             createTemplateDto.schemaId
//         );

//         const template = this.templateRepository.create(createTemplateDto);
//         return await this.templateRepository.save(template);
//     }

//     async renderTemplate(templateId: number, data: any): Promise<any> {
//         const template = await this.findOne(templateId);

//         // Validate data against schema
//         await this.schemaService.validate(template.schemaId, data);

//         // Deep clone the template
//         const rendered = JSON.parse(JSON.stringify(template.template));

//         // Replace all template variables
//         const replaceTemplateVars = (obj: any) => {
//             for (const key in obj) {
//                 if (typeof obj[key] === 'string') {
//                     obj[key] = obj[key].replace(/\{\{(\w+)\}\}/g, (match, key) => {
//                         return data[key] || match;
//                     });
//                 } else if (typeof obj[key] === 'object') {
//                     replaceTemplateVars(obj[key]);
//                 }
//             }
//         };

//         replaceTemplateVars(rendered);
//         return rendered;
//     }

//     private async validateTemplateAgainstSchema(
//         template: any,
//         schemaId: number
//     ): Promise<void> {
//         const schema = await this.schemaService.findOne(schemaId);
//         const templateVars = this.extractTemplateVariables(template);

//         // Check if all template variables exist in schema properties
//         for (const variable of templateVars) {
//             if (!schema.schema.properties[variable]) {
//                 throw new BadRequestException(
//                     `Template variable ${variable} not found in schema properties`
//                 );
//             }
//         }
//     }

//     private extractTemplateVariables(template: any): string[] {
//         const vars = new Set<string>();
//         const extract = (obj: any) => {
//             for (const key in obj) {
//                 if (typeof obj[key] === 'string') {
//                     const matches = obj[key].match(/\{\{(\w+)\}\}/g);
//                     if (matches) {
//                         matches.forEach(match => {
//                             vars.add(match.replace(/\{\{|\}\}/g, ''));
//                         });
//                     }
//                 } else if (typeof obj[key] === 'object') {
//                     extract(obj[key]);
//                 }
//             }
//         };
//         extract(template);
//         return Array.from(vars);
//     }

//     // ... CRUD operations similar to SchemaService
// }