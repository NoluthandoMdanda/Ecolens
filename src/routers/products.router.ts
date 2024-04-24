import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { createCaseInsensitiveFilter } from 'src/helper/collectionFilter';
import { IProduct } from 'src/interfaces/IProduct';
import { IMongooseFilter } from 'src/models/BaseModel';
import { ProductModel } from 'src/models/ProductModel';
import { BaseModelRouter } from './baseModel.router';

export class ProductRouter extends BaseModelRouter<IProduct> {
    constructor(mongoDBConnection: string) {
        super();
        this.model = new ProductModel(mongoDBConnection);
    }

    public override initializeRoutes(): void {
        // ----------------------------------- GET -----------------------------------\\
        // localhost:3000/products
        // localhost:3000/products?category=eyeglasses&material=wood
        this.router.get(
            '/',
            async (req: Request, res: Response): Promise<void> => {
                try {
                    const { category, material } = req.query;
                    let filter: object = {};
                    if (category) {
                        filter = createCaseInsensitiveFilter(
                            filter,
                            'category',
                            category as string
                        );
                    }
                    if (material) {
                        filter = createCaseInsensitiveFilter(
                            filter,
                            'glassesInfo.material',
                            material as string
                        );
                    }
                    const products = await this.model.getDocuments(filter);
                    res.json(products);
                } catch (error) {
                    console.error('Error fetching products:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            }
        );

        // localhost:3000/products/1
        this.router.get(
            '/:id',
            async (req: Request, res: Response): Promise<void> => {
                const productId = req.params.id;
                try {
                    const product = await this.model.getById(productId);
                    if (!product) {
                        res.status(404).json({ error: 'Product not found' });
                    } else {
                        res.json(product);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            }
        );

        // localhost:3000/products/1
        this.router.get(
            '/:id',
            async (req: Request, res: Response): Promise<void> => {
                const productId = req.params.id;
                try {
                    const product = await this.model.getById(productId);
                    if (!product) {
                        res.status(404).json({ error: 'Product not found' });
                    } else {
                        res.json(product);
                    }
                } catch (error) {
                    console.error('Error fetching product:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                }
            }
        );

        // ----------------------------------- POST -----------------------------------\\
        this.router.post('/', async (req: Request, res: Response) => {
            try {
                const newProduct = req.body as IProduct;
                const result = await this.model.insert(newProduct);

                result
                    ? res
                          .status(201)
                          .send(
                              `Successfully created a new product with id ${result.insertedId}`
                          )
                    : res.status(500).send('Failed to create a new product.');
            } catch (error) {
                console.error(error);
                res.status(400).send(error.message);
            }
        });

        // ----------------------------------- PUT -----------------------------------\\
        this.router.put('/:id', async (req: Request, res: Response) => {
            const id = req?.params?.['id'];

            try {
                const updatedProduct: IProduct = req.body as IProduct;
                const query = { _id: new mongoose.Types.ObjectId(id) };
                const updateItem = {
                    $set: updatedProduct,
                };
                const result = await this.model.update(query, updateItem);

                result
                    ? res
                          .status(200)
                          .send(`Successfully updated Product with id ${id}`)
                    : res
                          .status(304)
                          .send(`Product with id: ${id} not updated`);
            } catch (error) {
                console.error(error.message);
                res.status(400).send(error.message);
            }
        });

        // ----------------------------------- DELETE -----------------------------------\\
        this.router.delete('/:id', async (req: Request, res: Response) => {
            const id = req?.params?.['id'];

            try {
                const query: IMongooseFilter = {
                    _id: new mongoose.Types.ObjectId(id),
                };
                const result = await this.model.delete(query);

                if (result && result.deletedCount) {
                    res.status(202).send(
                        `Successfully removed Product with id ${id}`
                    );
                } else if (!result) {
                    res.status(400).send(
                        `Failed to remove Product with id ${id}`
                    );
                } else if (!result.deletedCount) {
                    res.status(404).send(
                        `Product with id ${id} does not exist`
                    );
                }
            } catch (error) {
                console.error(error.message);
                res.status(400).send(error.message);
            }
        });
    }
}
