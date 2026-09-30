import { Body, Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';
import type { Response } from 'express';
import { AuthService } from './auth.service.js';
import type { AuthRequest } from './auth.service.js';
import { Public } from './access.guard.js';

class LoginDto {
  @IsEmail() @MaxLength(254) email!:string;
  @IsString() @Length(1,128) password!:string;
}
class RegisterDto {
  @IsString() @Length(1,100) name!:string;
  @IsEmail() @MaxLength(254) email!:string;
  @IsString() @Length(12,128) password!:string;
}
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth:AuthService) {}
  @Public() @Get('csrf') csrf(@Req() request:AuthRequest,@Res({passthrough:true}) response:Response) { return this.auth.bootstrap(request,response); }
  @Public() @Post('login') login(@Req() request:AuthRequest,@Res({passthrough:true}) response:Response,@Body() body:LoginDto) { return this.auth.login(request,response,body); }
  @Public() @Post('register') register(@Req() request:AuthRequest,@Res({passthrough:true}) response:Response,@Body() body:RegisterDto) { return this.auth.register(request,response,body); }
  @Post('logout') logout(@Req() request:AuthRequest,@Res({passthrough:true}) response:Response) { return this.auth.logout(request,response); }
}
@Controller('me')
export class MeController {
  @Get() me(@Req() request:AuthRequest) { return {data:request.authSession!.user}; }
}
