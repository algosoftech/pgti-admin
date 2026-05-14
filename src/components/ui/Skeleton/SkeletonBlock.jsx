import React from "react";
import { Skeleton } from "antd";

const SkeltonEffect = ({ qty=1 }) => {
  return (
    <>
    {Array(qty)
        .fill()
        .map((_, rowIndex) => (
            <div class="col-md-6 col-lg-4">
            <div className="card-box categories_card_box_for_pet">
              <div className="card-thumbnail">
                <Skeleton loading={true} active avatar>
                  
                </Skeleton>
              </div>
              <h3>
                <Skeleton loading={true} active paragraph={{ rows: 0 }}>
                  <span className="cotegories_pet_food">Training</span>
                </Skeleton>
              </h3>
              <p className="cotegories_about_food_description">
                <Skeleton loading={true} active paragraph={{ rows: 0 }} />
              </p>
              <div className="catogries_create_status">
                <div>
                  <span className="cartegories_created_on">
                    <Skeleton loading={true} active paragraph={{ rows: 0 }} />
                  </span>
                </div>
                <div>
                  <span className="cartegories_created_on_date">
                    <Skeleton loading={true} active paragraph={{ rows: 0 }} />
                  </span>
                </div>
              </div>
              <div className="catogries_product_create__switch">
                <div className="product_card_edit_button">
                  <Skeleton
                    loading={true}
                    active
                    paragraph={{ rows: 0 }}
                    className="btn btn-danger button_delete_producttt"
                  />
                </div>
                <div className="product_card_edit_button">
                  <Skeleton
                    loading={true}
                    active
                    paragraph={{ rows: 0 }}
                    className="btn btn-dark button_delete_producttt"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default SkeltonEffect;
