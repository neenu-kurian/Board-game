import {Controller, Get,Post,HttpCode,Body,NotFoundError,Param,Put} from 'routing-controllers'
import Game from './games/entity'

@Controller()
export default class MainController {

    colors=["red", "blue", "green", "yellow", "magenta"]

    rand = this.colors[Math.floor(Math.random() * this.colors.length)];

    defaultBoard = JSON.parse(JSON.stringify("[['o', 'o', 'o'],['o', 'o', 'o'],['o', 'o', 'o']]"))
    

    board = {"games":this.defaultBoard}
    
    @Get('/games')
    async allGames() {
      const games = await Game.find()
      return { games }
    }

    @Post('/games')
    @HttpCode(201)
    createGame(
    @Body() game: Game
    ) {
    game["color"]=this.rand
    game["board"]=this.defaultBoard
   
    return game.save()
   }

   @Put('/games/:id')
   async updateGame(
   @Param('id') id: number,
   @Body() update: Partial<Game>
   ) {
   const game = await Game.findOne(id)
   if (!game) throw new NotFoundError('Cannot find game')

  return Game.merge(game, update).save()
}

}