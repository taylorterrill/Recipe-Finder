// Imports router, models, and withAuth helper
const router = require('express').Router();
const { Recipe, User, Ingredient } = require('../../models');
const withAuth = require('../../utils/auth');

// This file creates /api/recipe routes

router.get('/', async (req, res) => {
  Recipe.findAll({
    include: [
      {
        model: User,
        attributes: ['name']
      }
    ]
  })
    .then(recipeData => res.json(recipeData))
    .catch(err => {
      res.status(500).json(err);
    })
})

router.get('/:id', withAuth, async (req, res) => {
  try {
    const recipeData = await Recipe.findOne({
      where: {
        id: req.params.id
      },
      include: [
        {
          model: Ingredient,
          attributes: ['id', 'ingredient_name']
        },
        {
          model: User,
          attributes: ["id", "name"]
        },
      ]
    });
    const recipe = recipeData.get({ plain: true });
    res.render("recipe", {
      recipe,
      logged_in: req.session.logged_in
    });
  }
  catch (err) {
    res.status(500).json(err);
  };
});

router.post('/', withAuth, async (req, res) => {
  console.log(req.body);
  try {
    const newRecipe = await Recipe.create({
      ...req.body,
      user_id: req.session.user_id,
    });

    res.status(200).json(newRecipe);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', withAuth, async (req, res) => {
  try {
    const recipedata = Recipe.update(req.body, {
      where: {
        id: req.params.id
      }
    })
  } catch (err) {
    res.status(400).json(err);
  }
});

// We have the route created for deleting a recipe for future development opportunities
// Currently, we do not have a view component with this functionality
router.delete('/:id', withAuth, async (req, res) => {
  try {
    const recipeData = await Recipe.destroy({
      where: {
        id: req.params.id,
        user_id: req.session.user_id,
      },
    });

    if (!recipeData) {
      res.status(404).json({ message: 'No recipe found with this id!' });
      return;
    }

    res.status(200).json(recipeData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Exports router
module.exports = router;