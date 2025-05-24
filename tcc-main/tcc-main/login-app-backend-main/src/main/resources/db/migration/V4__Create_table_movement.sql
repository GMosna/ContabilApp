CREATE TABLE tb_movements (
    id SERIAL PRIMARY KEY,
    account_id BIGINT NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    movement_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,

    CONSTRAINT fk_movements_account FOREIGN KEY (account_id) REFERENCES tb_account(id)
);