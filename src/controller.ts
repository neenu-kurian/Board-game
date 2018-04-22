import {Controller, Get,Post,HttpCode,Body,NotFoundError,Param,Put, NotAcceptableError, BadRequestError} from 'routing-controllers'
import Game from './games/entity'
import {Validator} from "class-validator";


@Controller()
export default class MainController {
    validator = new Validator();

    colors=["red", "blue", "green", "yellow", "magenta"]

    rand = this.colors[Math.floor(Math.random() * this.colors.length)];

    defaultBoard = JSON.parse(JSON.stringify("[['o', 'o', 'o'],['o', 'o', 'o'],['o', 'o', 'o']]"))
    
    
    @Get('/games')
    async allGames() 
    {
      const games = await Game.find()
      return { games }
    }


    @Post('/games')
    @HttpCode(201)
    createGame(
    @Body() game: Game
    ) 
    {
      game["color"]=this.rand
      game["board"]=this.defaultBoard
     
      return game.save()
   }



   @Put('/games/:id')
   async updateGame(
   @Param('id') id: number,
   @Body() update: Partial<Game>
   ) 
   {
     const game = await Game.findOne(id)
     let previousBoard = game["board"]
    
     if(Object.keys(update).includes('color'))
     {
         if(this.validator.isNotIn((update.color),(this.colors)))
         {  
              throw new NotAcceptableError('invalid color')
         }
   
         else {
               if(Object.keys(update).includes('board'))
               {
                   let currentBoard=update.board
                   let moves=this.getMoves(previousBoard,currentBoard)
                   
                   if(moves>1)
                    return new BadRequestError('Invalid Move')
               }
            }
     }
     
     if (!game) throw new NotFoundError('Cannot find game')
     
     return Game.merge(game, update).save()
   }

 
  getMoves(previousBoard,currentBoard)
  {
     let slicedPrevBoard=previousBoard.slice(1,-1).replace("]","] ").split(" ")
     let slicedCurrBoard=currentBoard.slice(1,-1).replace("]","] ").split(" ")
     let strPrevBoard=""
     let strCurrBoard=""
    
     slicedPrevBoard.map((row, y) => {
         let newrow=row.replace(/"|'|\[|\]/gi,"") 
         strPrevBoard=strPrevBoard.concat(newrow)
     })
 
     slicedCurrBoard.map((row, y) => {
         let newrow=row.replace(/"|'|\[|\]/gi,"") 
         strCurrBoard=strCurrBoard.concat(newrow)
     })
     let moves=0
    
 
     let currBoard=strCurrBoard.split(',')
     let prevBoard=strPrevBoard.split(',')
 
     console.log(currBoard)
     console.log(prevBoard)
 
     currBoard.map((element,index)=>{
     if(element!=prevBoard[index]){
         moves=moves+1
     }})
 
     console.log(moves)
     return moves
  }

}