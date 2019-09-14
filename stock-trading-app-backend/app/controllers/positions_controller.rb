
class PositionsController < ApplicationController
  def index
    user=User.find_by(username: params[:username])
    positions=user.positions
    render json: PositionSerializer.new(positions).to_serialized_json
  end

  def create #to receive fetch post request from renderPortfolioView() in index.js
    user=User.find_by(username: params[:username]) #imagine getting a fetch request from JS with username as the params
    if !!params[:ticker] #taking fetch request from updateLatestPrice() method to update individual lines in the position table
      stock=Stock.find_by(ticker: params[:ticker])
      position=Position.find_by(user_id: user.id, stock_id: stock.id)
      render json: PositionSerializer.new(position).to_serialized_json
    else
      positions=user.positions
      render json: PositionSerializer.new(positions).to_serialized_json
    end
  end

  def updateprice
    user=User.find_by(username: params[:username]) #imagine getting a fetch request from JS with username as the params
    stock=Stock.find_by(ticker:params[:ticker]) #imagine getting a fetch request from JS containing ticker in params
    stock.latest_price=params[:price]
    stock.save
    position=Position.find_by(stock_id: stock.id, user_id: user.id)
    position.update_unrealized(price: params[:price].to_f)
    render json: PositionSerializer.new(position).to_serialized_json
  end


end
