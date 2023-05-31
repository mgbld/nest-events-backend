import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';
import { UpdateEventDto } from './update-event.dto';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Pipes can go and apply for a whole class at class level
// or even on the method
@Controller('/events')
export class EventsController {
  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
  ) {}

  @Get()
  async findAll() {
    return await this.repository.find();
  }

  // If JSON comes as input, it would return a JS object.
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id) {
    return this.repository.findOne({
      where: { id },
    });
  }

  // @UsePipes()
  @Post()
  // Validation groups are for routes. For this to work there has not to be a global validation pipe
  // Perform different validations upon context
  // async create(@Body(new ValidationPipe({ groups: ['create']})) input: CreateEventDto) {
  async create(@Body(ValidationPipe) input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when),
    });
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne({
      where: { id },
    });

    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when,
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    await this.repository.delete(id);
  }
}
