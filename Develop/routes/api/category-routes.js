const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', (req, res) => {
  Category.findAll({
    attributes: [
      'id',
      'category_name',
    ]
  }) .then(dbCategoryData => res.json(dbCategoryData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
Category.findOne({
    where: {
      id: req.params.id
    }
  })
    .then(dbCategoryData => {
      if (!dbCategoryData) {
        res.status(404).json({ message: 'No category found with this id' });
        return;
      }
      res.json(dbCategoryData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
  // create a new category
  Category.create(req.body)
    .then((category) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.CategoryIds.length) {
        const categoryTagIdArr = req.body.CategoryIds.map((tag_id) => {
          return {
            category_id: category.id,
            category_name,
          };
        });
        return CategoryTag.bulkCreate(categoryTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(category);
    })
    .then((categoryTagIds) => res.status(200).json(categoryTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((catgoryID) => {
      // find all associated tags from ProductTag
      return CategoryIds.findAll({ where: { catergory_id: req.params.id } });
  })
    .then((CategoryIds) => {
      // get list of current tag_ids
      const categoryTagIds = categoryTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newCategoryTags = req.body.tagIds
        .filter((tag_id) => !categoryTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            category_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const categoryTagsToRemove = categoryTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        CategoryTag.destroy({ where: { id: categoryTagsToRemove } }),
        CategoryTag.bulkCreate(newCategoryTags),
      ]);
    })
    .then((updatedCategoryTags) => res.json(updatedCategoryTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(dbCategoryData => {
      if (!dbCategoryData) {
        res.status(404).json({ message: 'Category deleted' });
        return;
      }
      res.json(dbCategoryData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
