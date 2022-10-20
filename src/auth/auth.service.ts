import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable({})
export class AuthService {
  private prismaService: PrismaService;
  private jwtService: JwtService;
  private configService: ConfigService;

  constructor(
    prismaService: PrismaService,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.prismaService = prismaService;
    this.jwtService = jwtService;
    this.configService = configService;
  }

  async signup(dto: AuthDto) {
    const hash = await argon.hash(dto.password);
    try {
      const user = await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
      });
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002')
          throw new ForbiddenException(
            'Credentials already present for this email',
          );
        throw error;
      }
    }
  }

  async signin(dto: AuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new ForbiddenException('Credentials Incorrect');
    const password_match = await argon.verify(user.hash, dto.password);
    if (!password_match) throw new ForbiddenException('Credentials Incorrect');
    return this.signToken(user.id, user.email);
  }

  async signToken(
    user_id: number,
    email: string,
  ): Promise<{
    access_token: string;
  }> {
    const payload = {
      sub: user_id,
      email: email,
    };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get('JWT_SECRET'),
    });
    return {
      access_token: access_token,
    };
  }
}
