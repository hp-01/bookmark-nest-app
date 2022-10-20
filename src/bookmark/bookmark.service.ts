import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookMarkDto, EditBookMarkDto } from './dto';
import { ForbiddenException } from '@nestjs/common/exceptions';
@Injectable()
export class BookmarkService {
  constructor(private prismaService: PrismaService) {}
  async getBookmarks(user_id: number) {
    const bookmarks = await this.prismaService.bookmark.findMany({
      where: { user_id: user_id },
    });
    return bookmarks;
  }

  async getBookmarkById(user_id: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: { id: bookmarkId, user_id: user_id },
    });
    return bookmark;
  }

  async createBookmark(user_id: number, dto: CreateBookMarkDto) {
    const bookmark = await this.prismaService.bookmark.create({
      data: {
        user_id: user_id,
        title: dto.title,
        description: dto.description,
        link: dto.link,
      },
    });
    return bookmark;
  }

  async editBookmarkById(
    user_id: number,
    bookmarkId: number,
    dto: EditBookMarkDto,
  ) {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: { id: bookmarkId, user_id: user_id },
    });
    if (!bookmark) throw new ForbiddenException('Access to resource denied');

    return await this.prismaService.bookmark.update({
      where: { id: bookmarkId },
      data: { ...dto },
    });
  }

  async deleteBookmarkById(user_id: number, bookmarkId: number) {
    const bookmark = await this.prismaService.bookmark.findFirst({
      where: { id: bookmarkId, user_id: user_id },
    });
    if (!bookmark) throw new ForbiddenException('Access to resource denied');
    await this.prismaService.bookmark.delete({ where: { id: bookmarkId } });
  }
}
