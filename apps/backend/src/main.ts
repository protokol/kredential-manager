import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { HttpException, HttpStatus, ValidationPipe } from "@nestjs/common";
import { useContainer } from "class-validator";
import { EbsiExceptionFilter } from "./error/ebsi-exception.filter";
import { createError } from "./error/ebsi-error";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = new DocumentBuilder()
        .setTitle("Kredential")
        .setDescription("API for Kredential")
        .setVersion("0.2")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        exceptionFactory: (errors) => {
            return new HttpException(
                createError(
                    'INVALID_REQUEST',
                    Object.values(errors[0].constraints)[0]
                ),
                HttpStatus.BAD_REQUEST
            );
        }
    }));
    app.useGlobalFilters(new EbsiExceptionFilter());

    // Use the container for class-validator
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.enableCors({
        origin: "*",
    });

    await app.listen(3000);
}
bootstrap();
