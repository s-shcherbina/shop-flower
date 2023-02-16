import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Roles } from 'src/decorators/roles.decorators';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Role } from 'src/types';
import { v4 } from 'uuid';
import { createImageDTO } from './dto';
import { ImageEntity } from './entities/image.entity';
import { ImagesService } from './images.service';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 12, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          callback(null, v4() + `${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return callback(
            new HttpException('Тількі фото', HttpStatus.BAD_REQUEST),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadImages(@Body() dto: createImageDTO, @UploadedFiles() files) {
    return this.imagesService.uploadImages(dto, files);
  }

  @Get()
  getGoods(@Query('goodId') goodId: number): Promise<ImageEntity[]> {
    return this.imagesService.getImages(goodId);
  }

  @Get(':id')
  getGood(@Param('id') id: number): Promise<ImageEntity> {
    return this.imagesService.getImage(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  removeGood(@Param('id') id: number): Promise<string> {
    return this.imagesService.removeImage(id);
  }

  // @Get()
  // removeImages(@Query('goodId') goodId: number) {
  //   return this.imagesService.removeImgsOfGood(goodId);
  // }
}
