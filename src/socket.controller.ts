import { All, Body, Controller, Get, Query, Req, Request, Headers, HttpException, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientService } from './client/client.service';
import { tap } from 'rxjs/operators';
import { operators } from 'rxjs/internal/Rx';
import { EventService } from './client/event.service';
import { ChatGateway } from './chat/chat.gateway';
import { AuthGuard } from './auth.guard';
import { SocketGuard } from './gaurds/socket.guard';

@Controller('api/v1/socket')
export class SocketController {
  constructor(private readonly appService: AppService,
              private eventService: EventService,
              private chatGateway: ChatGateway) {
  }

  @Post('sendMessage')
  sendMessage(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): { rooms: object[] } {
    const selectedRoomsData = this.chatGateway.queryRooms(body.consumer);
    const event = body.event;
    const payload = body.payload;
    this.chatGateway.sendMessageToRooms(selectedRoomsData.selectedRoomNames, event, payload);
    if (selectedRoomsData.selectedRooms.length === 0) {
      const namespace = body.consumer.namespace;
      const allRoomsInNamespace = this.chatGateway.queryRooms({ namespace });
      const allRoomsInNamespaceCount = allRoomsInNamespace.selectedRooms.length;
      if (allRoomsInNamespace.selectedRooms.length === 0) {
        throw new HttpException({ error: true, message: `There are no clients in ${namespace} namespace` }, HttpStatus.UNPROCESSABLE_ENTITY);
      }
      throw new HttpException({
        error: true,
        message: `No clients found with these parameters. Total clients in ${namespace} namespace =  ${allRoomsInNamespaceCount}`,
      }, HttpStatus.UNPROCESSABLE_ENTITY);
    }
    return {
      rooms: selectedRoomsData.selectedRooms,
    };
  }

  @Post('queryRooms')
  queryRooms(@Req() request: Request, @Body() body, @Query() query, @Headers() headers): { rooms: object[] } {
    if (!body.namespace) {
      throw new HttpException('Namespace not provided. If you dont have any, use TEMP', HttpStatus.UNPROCESSABLE_ENTITY);
    }
    const selectedRoomsData = this.chatGateway.queryRooms(body);
    return {
      rooms: selectedRoomsData.selectedRooms,
    };
  }
}
