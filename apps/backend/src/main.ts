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
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            forbidNonWhitelisted: true,
            errorHttpStatusCode: HttpStatus.BAD_REQUEST,
            exceptionFactory: (errors) => {
                if (!errors || errors.length === 0) {
                    throw new Error("Validation failed: No errors provided.");
                }

                const firstError = errors[0];
                const constraints = firstError.constraints;

                if (!constraints || Object.keys(constraints).length === 0) {
                    return new HttpException(
                        createError(
                            "INVALID_REQUEST",
                            "Validation failed: Invalid or missing constraints",
                        ),
                        HttpStatus.BAD_REQUEST,
                    );
                }

                return new HttpException(
                    createError(
                        "INVALID_REQUEST",
                        Object.values(constraints)[0], // Safely access the first constraint message
                    ),
                    HttpStatus.BAD_REQUEST,
                );
            },
        }),
    );
    app.useGlobalFilters(new EbsiExceptionFilter());

    // Use the container for class-validator
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    app.enableCors({
        origin: "*",
    });

    await app.listen(3000);
}
bootstrap();
