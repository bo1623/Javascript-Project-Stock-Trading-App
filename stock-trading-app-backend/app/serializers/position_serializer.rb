class PositionSerializer
  # include FastJsonapi::ObjectSerializer
  # attributes
  def initialize(position)
    @position=position
  end

  def to_serialized_json
    options={
      include:{
        stock:{
          only: [:ticker]
        },
        user:{
          only: [:username,:cash_balance]
        }
      }
    }
    @position.to_json(options)
  end

end
