import { Response, Request, NextFunction } from "express";
import { RoadmapService } from "../../services/roadmap/roadmap.service";
import { StatusCodes } from "http-status-codes";
import { ChapterService } from "../../services/chapter/chapter.service";
import { SubchapterService } from "../../services/subchapter/subchapter.service";
import { MaterialService } from "../../services/material/material.service";
import { AuthRequest } from "../../type/roadmap.type";

export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  createDraft = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "User authentication required!",
        });
        return;
      }

      const createDto = req.body;

      const roadmap = await this.roadmapService.createDraft(userId, createDto);

      res.status(StatusCodes.CREATED).json({
        success: true,
        data: roadmap,
        message: "Draft roadmap created successfully",
      });
    } catch (error) {
      next(error);
      console.error("Error: ", error);
    }
  };

  generateRoadmap = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const roadmapId = req.params.roadmapId;
      const userId: string = req.user?.id ?? "";

      if (!roadmapId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include roadmapId",
        });
        return;
      }

      const roadmap = await this.roadmapService.generateRoadmap(
        roadmapId,
        userId
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: roadmap,
        message: "Roadmap successfully generated",
      });
    } catch (error) {
      next(error);
      console.error("Error: ", error);
    }
  };

  getRoadmapById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roadmapId } = req.params;
      const userId = req.user?.id as string;

      if (!roadmapId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include roadmapId",
        });
      }

      const roadmap = await this.roadmapService.getRoadmapById(
        roadmapId,
        userId
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: roadmap,
        message: "successfully get Roadmap data",
      });
    } catch (error) {
      next(error);
      console.error("Error: ", error);
    }
  };

  getUserRoadmaps = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id as string;
      const { page, limit, status } = req.body.options;

      if (!userId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Must include userId",
        });
      }

      const options = { page, limit, status };

      const roadmaps = await this.roadmapService.getUserRoadmaps(
        userId,
        options ?? null
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: roadmaps,
        message: "successfully getting user roadmap's",
      });
    } catch (error) {
      next(error);
      console.error("Error: ", error);
    }
  };

  deleteRoadmap = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id as string;
      const roadmapId = req.params.roadmapId;

      if (!userId || !roadmapId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Invalid request. Must include userId and roadmapId",
        });
      }

      const deletedRoadmap = await this.roadmapService.deleteRoadmap(
        roadmapId,
        userId
      );

      res.status(StatusCodes.OK).json({
        success: true,
        message: `Successfully deleted roadmap with id ${roadmapId}`,
      });
    } catch (error) {
      next(error);
      console.error("Error: ", error);
    }
  };
}

export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  generateChapter = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { sectionId } = req.params;
      const payload = req.body;

      if (!sectionId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Section Id is required",
        });
        return;
      }

      const chapters = this.chapterService.generateChapter(sectionId, payload);

      res.status(StatusCodes.OK).json({
        success: true,
        message: "",
        data: chapters,
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };
}

export class SubchapterController {
  constructor(private readonly subchapterService: SubchapterService) {}

  generateSubchapters = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { chapterId } = req.params;

      if (!chapterId) {
        res.status(StatusCodes.BAD_REQUEST).json({
          message: "Chapter ID is required!",
          success: false,
        });

        return;
      }

      const subchapters = this.subchapterService.generateSubchapters(
        chapterId,
        req.body
      );

      res.status(StatusCodes.OK).json({
        success: true,
        data: subchapters,
        messsage: "Subchapter's sucessfully generated",
      });
    } catch (error) {
      console.error("Error: ", error);
      next(error);
    }
  };
}

export class MaterialControlller {
  constructor(private readonly materialService: MaterialService) {}
}
