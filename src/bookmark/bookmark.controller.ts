import {
  Controller,
  UseGuards,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { BookmarkService } from './bookmark.service';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  @Get()
  getBookmarks(@GetUser('id') user_id: number) {
    return this.bookmarkService.getBookmarks(user_id);
  }

  @Get(':id')
  getBookmarkById(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(user_id, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUser('id') user_id: number,
    @Body() dto: CreateBookMarkDto,
  ) {
    return this.bookmarkService.createBookmark(user_id, dto);
  }

  @Patch(':id')
  editBookmarkById(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookMarkDto,
  ) {
    return this.bookmarkService.editBookmarkById(user_id, bookmarkId, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') user_id: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(user_id, bookmarkId);
  }
}
