import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ContentService } from './content.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('content')
@Controller({ path: 'content', version: '1' })
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('home')
  @ApiOperation({ summary: 'Get home page content' })
  @ApiQuery({ name: 'language', required: false })
  async getHomeContent(@Query('language') language = 'fa') {
    return this.contentService.getHomeContent(language);
  }

  @Public()
  @Get('about')
  @ApiOperation({ summary: 'Get about page content' })
  @ApiQuery({ name: 'language', required: false })
  async getAboutContent(@Query('language') language = 'fa') {
    return this.contentService.getAboutContent(language);
  }

  @Public()
  @Get('contact')
  @ApiOperation({ summary: 'Get contact page content' })
  @ApiQuery({ name: 'language', required: false })
  async getContactContent(@Query('language') language = 'fa') {
    return this.contentService.getContactContent(language);
  }

  @Public()
  @Get('footer')
  @ApiOperation({ summary: 'Get footer content' })
  @ApiQuery({ name: 'language', required: false })
  async getFooterContent(@Query('language') language = 'fa') {
    return this.contentService.getFooterContent(language);
  }

  @Public()
  @Get('popular-destinations')
  @ApiOperation({ summary: 'Get popular destinations for home page' })
  @ApiQuery({ name: 'language', required: false })
  async getPopularDestinations(@Query('language') language = 'fa') {
    return this.contentService.getPopularDestinations(language);
  }
  
  @Public()
  @Get('advertisements')
  @ApiOperation({ summary: 'Get active advertisements' })
  @ApiQuery({ name: 'placement', required: false })
  async getAdvertisements(@Query('placement') placement?: string) {
    return this.contentService.getAdvertisements(placement);
  }

}
