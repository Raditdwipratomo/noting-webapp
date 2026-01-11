import { NextFunction, Response } from "express";
import { SectionService } from "../../services/roadmap/section.service";
import { AuthRequest } from "../../type/roadmap.type";
import { StatusCodes } from "http-status-codes";

export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  getSectionById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sectionId } = req.params;

      if (!sectionId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must contain sectionId",
        });
        return;
      }

      const section = await this.sectionService.getSectionById(sectionId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Successfully getting section data",
        data: section,
      });
    } catch (error) {
      next(error);
      console.error("Error: ", error);
    }
  };

  getSectionsByRoadmapId = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roadmapId } = req.params;

      if (!roadmapId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include roadmapId",
        });
        return;
      }

      const sections = await this.sectionService.getSectionsByRoadmapId(
        roadmapId
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: "Successfully get sections data",
        data: sections,
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };

  generateChaptersFromAI = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { sectionId } = req.params;

      if (!sectionId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include sectionId",
        });
        return;
      }

      const chapters = await this.sectionService.generateChaptersFromAI(
        sectionId
      );

      res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Successfully generated chapters from ai",
        data: chapters,
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };

  deleteSectionsByRoadmapId = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roadmapId } = req.params;
      if (!roadmapId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include Roadmap Id",
        });
        return;
      }

      await this.sectionService.deleteSectionByRoadmapId(roadmapId);

      res.status(StatusCodes.OK).json({
        success: true,
        message: `Successfully deleted sections with roadmap id ${roadmapId}`,
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };

  deleteSectionById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { sectionId } = req.params;

    if (!sectionId) {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Must include section id",
      });

      return;
    }

    await this.sectionService.deleteSection(sectionId);

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Successfully deleted section with id ${sectionId}`,
    });
  };

  updateSection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { sectionId } = req.params;
      const { updates } = req.body;

      if (!sectionId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include sectionId",
        });

        return;
      }

      const updaedSection = await this.sectionService.updateSection(
        sectionId,
        updates
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: `Successfully updated section with id ${updaedSection}`,
        updaedSection,
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };
}
