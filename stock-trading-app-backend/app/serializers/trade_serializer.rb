class TradeSerializer
  # include FastJsonapi::ObjectSerializer
  # attributes
  def initialize(trade)
    @trade=trade
  end

  def to_serialized_json
    options={
      include:{
        stock:{
          only: [:ticker]
        },
        user:{
          only: [:username]
        }
      }
    }
    @trade.to_json(options)
  end

end
